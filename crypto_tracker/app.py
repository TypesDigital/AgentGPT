from __future__ import annotations

import asyncio
import contextlib
import os
from collections import deque
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

import httpx
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

POLL_INTERVAL_SECONDS = 10
MAX_POINTS = 180
COINGECKO_URL = "https://api.coingecko.com/api/v3/simple/price"
DEFAULT_ASSETS = {
    "bitcoin": {"symbol": "BTC", "label": "Bitcoin"},
    "ethereum": {"symbol": "ETH", "label": "Ethereum"},
}


@dataclass
class PriceStore:
    history: dict[str, deque[dict[str, Any]]] = field(
        default_factory=lambda: {
            asset_id: deque(maxlen=MAX_POINTS) for asset_id in DEFAULT_ASSETS
        }
    )
    latest: dict[str, dict[str, Any]] = field(default_factory=dict)
    last_updated: str | None = None

    def add_snapshot(self, prices: dict[str, float], timestamp: datetime) -> None:
        iso_timestamp = timestamp.isoformat()
        self.last_updated = iso_timestamp
        for asset_id, meta in DEFAULT_ASSETS.items():
            price = prices[asset_id]
            point = {
                "timestamp": iso_timestamp,
                "symbol": meta["symbol"],
                "label": meta["label"],
                "price": price,
            }
            self.latest[asset_id] = point
            self.history[asset_id].append(point)

    def payload(self) -> dict[str, Any]:
        return {
            "lastUpdated": self.last_updated,
            "assets": {
                asset_id: {
                    "symbol": DEFAULT_ASSETS[asset_id]["symbol"],
                    "label": DEFAULT_ASSETS[asset_id]["label"],
                    "latest": self.latest.get(asset_id),
                    "history": list(self.history[asset_id]),
                }
                for asset_id in DEFAULT_ASSETS
            },
        }


store = PriceStore()
templates = Jinja2Templates(directory="crypto_tracker/templates")


async def fetch_prices() -> dict[str, float]:
    params = {
        "ids": ",".join(DEFAULT_ASSETS.keys()),
        "vs_currencies": "usd",
    }
    timeout = httpx.Timeout(10.0, connect=5.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.get(COINGECKO_URL, params=params)
        response.raise_for_status()
        payload = response.json()

    return {
        asset_id: float(payload[asset_id]["usd"])
        for asset_id in DEFAULT_ASSETS
    }


async def poll_prices() -> None:
    while True:
        try:
            prices = await fetch_prices()
            store.add_snapshot(prices, datetime.now(timezone.utc))
        except Exception as exc:  # noqa: BLE001
            print(f"Price polling failed: {exc}")
        await asyncio.sleep(POLL_INTERVAL_SECONDS)


@contextlib.asynccontextmanager
async def lifespan(_: FastAPI):
    try:
        prices = await fetch_prices()
        store.add_snapshot(prices, datetime.now(timezone.utc))
    except Exception as exc:  # noqa: BLE001
        print(f"Initial price fetch failed: {exc}")

    task = asyncio.create_task(poll_prices())
    try:
        yield
    finally:
        task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await task


app = FastAPI(
    title="Crypto Tracker",
    version="1.0.0",
    lifespan=lifespan,
)
app.mount("/static", StaticFiles(directory="crypto_tracker/static"), name="static")


@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request) -> HTMLResponse:
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "poll_interval": POLL_INTERVAL_SECONDS,
            "assets": DEFAULT_ASSETS,
        },
    )


@app.get("/api/prices", response_class=JSONResponse)
async def prices() -> JSONResponse:
    return JSONResponse(store.payload())


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("crypto_tracker.app:app", host="0.0.0.0", port=port, reload=True)
