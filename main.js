
// Sends a request every x interval to reserve a PPQ plate combination so you don't have to pay for the Layby fee

const request = require('request').defaults({ gzip: true, forever: true, timeout: 30000 });

function logCookies(jar) {
    jar._jar.store.getAllCookies(function (err, cookieArray) {
        if (err) throw new Error("Failed to get cookies");
        console.log(JSON.stringify(cookieArray, null, 4));
    });
}


class ReservePlate {
    constructor (plateCombo, checkoutLink) {
        this._jar = request.jar();
        this._plateCombo = plateCombo;
        this._checkoutLink = checkoutLink;
        this.isAvailable();
    }

    isAvailable () {
        console.log(`[PPQ RESERVER] Checking if "${this._plateCombo}" combination is available.`);
        // Check if plate is available
        request({
            json: true,
            jar: this._jar,
            url: `https://api.ppq.com.au/api//combination/available?vehicleTypeId=1&combination=${this._plateCombo}`
        }, (err, resp, body) => {
            // Success request
            if (body && body.Data) {
                const _isAvailble = body.Data.Available;
                // Is it available?
                if (_isAvailble) {
                    console.log(`[PPQ RESERVER] "${this._plateCombo}" combination is available! Reserving now...`);
                    return this.reservePlate();
                } else {
                    console.log(`[PPQ RESERVER] "${this._plateCombo}" combination IS NOT available, checking again in 10 seconds...`);
                }
            }
            // Failed, timeout, retry
            setTimeout(() => this.isAvailable(), 10000);
        });
    }

    reservePlate () {
        request({
            json: true,
            jar: this._jar,
            url: 'https://api.ppq.com.au/api/session/UpdateReservation/3f446b19-ab66-49dc-9f27-d55e76be4324?v=f36af70eba0148d1aabb0b88db494eb2',
            headers: {
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'accept-language': 'en-US,en;q=0.9',
                'cache-control': 'max-age=0',
                'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="99", "Google Chrome";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'document',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-site': 'none',
                'sec-fetch-user': '?1',
                'upgrade-insecure-requests': '1',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36'
            }
        }, (err, resp, body) => {
            // Success
            if (body && body.Success) {
                console.log(`[PPQ RESERVER] "${this._plateCombo}" combination IS RESERVED for you under this link: ${this._checkoutLink}`);
            } else {
            // Failed
                console.log("Failed?");
            }
            return setTimeout(() => this.reservePlate(), 60000);
        });
    }
}

new ReservePlate("LWKY", "https://www.ppq.com.au/checkout?ticket=3f446b19-ab66-49dc-9f27-d55e76be4324");