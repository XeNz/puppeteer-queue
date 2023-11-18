# Puppeteer queue

## What does this do

- Small application that has two endpoints:
    - GET /healthz
    - GET /scrape/url={someUrl}
        - Uses an async worker queue internally to process scraping requests with `Puppeteer`.
            - The internal queue was implemented to manage memory usage of this kind of application. Rendering pages
              `Chromium` and `Puppeteer` tends to create memory bursts/spikes. Using this queue will allow us to have
              more control
              of the memory allocation and thus making it easier to deploy in environments where memory is restricted
              such as `Kubernetes`.
        - Returns scraped HTML of the url parameter

## How to run this

### Run locally

- Tested with `Node 18.18`, probably works with other `node` versions as well
- Currently expects a chromium install at /usr/bin/chromium
- Application will be available on port `8060`

### Run with docker / docker-compose

- There are two services listed in the `docker-compose.yml` file. Choose the right architecture for your machine.
- Application will be available on port `8060`

### Planned TODOs

- Environmentalize multiple parameters:
    - The port on which the application should run
    - The worker queue count
    - The wait time on pages
    - Additional scraping metadata:
        - Specific div to scrape
        - Specific headers collection to use when requesting page
