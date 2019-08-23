import { BaseWebRequest, Request } from 'request-group';
import * as cheerio from 'cheerio';
import * as moment from 'moment';
import * as URL from 'url';
import * as request from 'request';

export class CheerioRequest extends BaseWebRequest<CheerioStatic> {
    protected userAgent: string | null;
    public constructor(url: string, userAgent: string | null = null) {
        super(url);
        this.userAgent = userAgent;
    }

    /**
     * Properly dispose of any resources that we need to get rid of
     */
    public dispose(): Promise<void> {
        return new Promise((resolve): void => {
            resolve();
        });
    }

    /**
     * Rather then run the request, it "builds" from the html passed in. Useful for reconstruction
     * @param html The string that we want to feed into our page data object
     */
    public runFromHtml(html: string): Promise<Request<CheerioStatic>> {
        return new Promise((resolve): void => {
            this.pageData = cheerio.load(html);
            this.momentPing = moment();
            this.momentDone = moment();
            this.requestCompleted = true;
            this.momentDuration = moment.duration(this.momentInitiated.diff(this.momentDone));
            resolve(this);
        });
    }

    /**
     * Make a request out to the interweb world
     */
    public run(): Promise<Request<CheerioStatic>> {
        let urlTarget = URL.parse(this.requestUrl);
        let urlHost: string | undefined = urlTarget.hostname;
        return new Promise((resolve, reject): void => {
            if (urlHost === undefined) {
                reject();
            } else {
                let headers = {
                    'User-Agent': this.userAgent,
                    Connection: 'keep-alive',
                    Accept: '*/*',
                    Host: urlHost as string,
                };

                if (this.requestCookie && this.requestCookie.trim().length > 0) {
                    headers['Cookie'] = this.requestCookie;
                }

                console.log('Requesting: ' + this.requestUrl);

                request(
                    {
                        method: this.requestMethod,
                        uri: this.requestUrl,
                        headers: headers,
                        jar: typeof headers['Cookie'] == 'undefined' ? true : false,
                        strictSSL: false,
                    },
                    (error, response, body): void => {
                        this.momentPing = moment();
                        this.momentDone = moment();
                        this.requestCompleted = true;
                        this.momentDuration = moment.duration(this.momentInitiated.diff(this.momentDone));
                        this.requestErrors.push(error);
                        this.pageData = cheerio.load(body);
                        // console.log('Cheerio Parse complete: ' + this.requestUrl);
                        resolve(this);
                    },
                );
            }
        });
    }
}

export default CheerioRequest;
