const express = require('express');
const puppeteer = require('puppeteer');
const {queue} = require("async/index");

const app = express();
const port = 8060;

/**
 * @param {string} url
 */
async function scrapeUrl(url) {
    let content = undefined;
    let browser = undefined;
    try {
        const args = ["--disable-gpu", "--disable-dev-shm-usage", "--disable-setuid-sandbox", "--no-sandbox"]

        browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium', headless: 'new', args: args
        });
        console.log("Starting and initializing browser")
        const page = await browser.newPage();
        await page.setJavaScriptEnabled(true);

        console.log(`Going to page ${url}`)
        await page.goto(url, {waitUntil: 'networkidle2'});

        console.log(`Waiting for page ${url}`)
        await page.waitForNetworkIdle({idleTime: 3000})

        console.log(`Getting content for page ${url}`)
        content = await page.content();
    } catch (e) {
        console.error(e);
    } finally {
        if (browser) {
            browser.close();
        }
    }
    return content;
}

const q = queue(function (scrapeTask, callback) {
    (async () => {
        console.log('Executing item in queue with url ' + scrapeTask.url);
        const content = await scrapeUrl(scrapeTask.url);
        callback(null, {content: content});
    })();
}, 2);

q.error(function (err, task) {
    console.error(`Task for ${task.url} experienced an error: ${err}`);
});

app.get('/scrape', async function (req, res) {
    const url = req.query.url;
    console.log(`Got ${url} to scrape`);
    q.push([{url: url}], function (err, result) {
        console.log("Entered callback, returning result to request");

        /**
         * @param {string} errorMessage
         */
        function handleError(errorMessage) {
            res.status(500).send({error: errorMessage});
        }

        if (err != null) {
            handleError("Something went wrong. Error: " + err);
        } else if (result?.content === undefined) {
            handleError("Something went wrong. No content was returned.");
        } else if (result.content) {
            console.log(`Got some content for ${url}, outputting html`);
            res.setHeader("Content-Type", "text/html");
            res.send(result.content);
        }
        console.log(`Finished processing ${url}`);
    });
});

app.get('/healthz', function (req, res) {
    res.sendStatus(200)
})

app.listen(port, function () {
    console.log(`Running on port ${port}.`);
});


