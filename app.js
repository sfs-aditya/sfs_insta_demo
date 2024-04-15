const express = require('express');
const app = express();
const { Builder, By, until } = require('selenium-webdriver');
const axios = require('axios');
const ytdl = require('ytdl-core');


app.get('/getInstaShorts', async (req, res) => {
    const { url } = req.query;
    const data = url.split(".")[1];
    if (data == 'instagram') {
        await insta()
    }
    if (data == 'youtube') {
        await youtube()
    }
    // let driver = await new Builder().forBrowser('chrome').build();
    async function insta() {
        const mUrl = url.split('/')[3];
        if (mUrl === 'p') {
            await image();
        } else if (mUrl === 'reel') {
            await video();
        }
        async function video() {
            let driver = await new Builder().forBrowser('chrome').build();
            try {
                await driver.get(url);
                console.log('yes');
                let videoElement = await driver.wait(until.elementLocated(By.tagName('video')), 10000);
                let videoSrc = await videoElement.getAttribute('src');
                const response = await axios.get(videoSrc, { responseType: 'arraybuffer' });
                const videoData = response.data;
                res.set({
                    'Content-Type': 'video/mp4',
                    'Content-Disposition': 'attachment; filename="downloaded_video.mp4'
                });
                res.send(videoData);

            } catch (error) {
                console.error('Error:', error);
            } finally {
                await driver.quit();
            }
        }
        async function image() {
            const response = [];
            let driver = await new Builder().forBrowser('chrome').build();
            try {
                await driver.get(url);
                console.log('yes1');
                for (let i = 0; i < 9; i++) {
                    try {
                        const images = await driver.wait(until.elementsLocated(By.css('._aagv img')), 10000);
                        const imageSources = await Promise.all(images.map(img => img.getAttribute('src')));
                        response.push(...imageSources);

                        const nextButton = await driver.findElements(By.className('_afxw'));
                        await driver.sleep(500);
                        if (nextButton.length > 0) {
                            await nextButton[0].click();
                        } else {
                            res.json({ src: Array.from(new Set(response)) })
                        }
                    } catch (error) {
                    }
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                await driver.quit();
            }
        }
    }
    async function youtube() {
        ytdl.getInfo(url).then((info) => {
            const format = ytdl.chooseFormat(info.formats, { quality: "248" });
            res.json({ src: format.url })
        }).catch((err) => {
            console.error(err);
        });
    }
});

app.listen(9000, () => console.log('Server is listening'));