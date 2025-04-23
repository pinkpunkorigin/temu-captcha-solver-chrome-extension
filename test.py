from genericpath import isdir
import os
import shutil
from playwright_stealth import stealth_sync, StealthConfig
from playwright.sync_api import sync_playwright, Playwright

path_to_extension = "./"
user_data_dir = "/tmp/test-user-data-dir"

if os.path.isdir(user_data_dir):
    shutil.rmtree(user_data_dir)

proxy = {
    # "server": "45.67.2.8:5582",
    "server": "185.216.106.238:6315",
}

# proxy = None

stealth_config = StealthConfig(navigator_languages=False, navigator_vendor=False, navigator_user_agent=False)

def run(playwright: Playwright):
    context = playwright.chromium.launch_persistent_context(
        user_data_dir,
        proxy=proxy,
        headless=False,
        args=[
            f"--disable-extensions-except={path_to_extension}",
            f"--load-extension={path_to_extension}",
        ],
    )

    page = context.new_page()
    stealth_sync(page, config=stealth_config)

    page.goto("https://www.temu.com")
    input("trigger the captcha")

    # Test the background page as you would any other page.
    page.close()
    context.close()


with sync_playwright() as playwright:
    run(playwright)
