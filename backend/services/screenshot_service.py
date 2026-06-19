import os
import time

from playwright.sync_api import (
    sync_playwright
)


def capture_screenshots(
    game_url: str,
    output_dir: str
):

    os.makedirs(
        output_dir,
        exist_ok=True
    )

    with sync_playwright() as p:

        browser = (
            p.chromium.launch()
        )

        page = browser.new_page(
            viewport={
                "width": 1280,
                "height": 720
            }
        )

        page.goto(game_url)

        screenshots = []

        for i in range(5):

            time.sleep(1)

            filename = os.path.join(
                output_dir,
                f"{i}.png"
            )

            page.screenshot(
                path=filename
            )

            screenshots.append(
                filename
            )

        browser.close()

    return screenshots