# Cheerio ( Request Group Plugin )

This library provides a simple way to use Cheerio to pull information from a web page. It simply sets up the request and creates the cheerio interface for you automatically. Additionally plugs right into the [RequestGroup](https://github.com/GabrieleNunez/request-group) library giving you the ability to scrape multiple web pages as fast as you want. 

- - -

## Example

```typescript
// index.ts
import CheerioRequest from 'request-group-cheerio';
import { RequestGroup, Request } from 'request-group';

function cheerioExample(): Promise<void> {
    return new Promise(
        async (resolve): Promise<void> => {
            // create our Request Group object
            let requestGroup: RequestGroup<CheerioStatic> = new RequestGroup<CheerioStatic>(2, 1000);

            // hook in a callback that way we can read and manipulate the page data
            requestGroup.setRequestComplete(
                (request: Request<CheerioStatic>): Promise<void> => {
                    return new Promise((requestResolve): void => {
                        let $: CheerioStatic = request.getPage();

                        console.log(request.getMetadata<string>('request-name') + ' Looping through messages');
                        console.log(
                            request.getMetadata<string>('request-name') +
                                ' Total Messages: ' +
                                $('table.files td.message').length,
                        );

                        $('table.files td.message').each((index: number, element: CheerioElement): void => {
                            console.log(request.getMetadata<string>('request-name') + ' Iteration: ' + index);
                            let txt: string = $(element)
                                .text()
                                .trim();

                            if (txt.length > 0) {
                                console.log(request.getMetadata<string>('request-name') + ': ' + txt);
                            }
                        });

                        requestResolve();
                    });
                },
            );

            // these are the things we want to crawl
            let urls: string[] = [
                'https://github.com/GabrieleNunez/request-group',
                'https://github.com/GabrieleNunez/bronco',
                'https://github.com/GabrieleNunez/thecoconutcoder.com',
                'https://github.com/GabrieleNunez/webcam.js',
            ];

            // loop through our urls and then add them into the queue
            for (var i = 0; i < urls.length; i++) {
                console.log('Adding: ' + urls[i]);
                let cheerioRequest: CheerioRequest = new CheerioRequest(urls[i]);
                let requestName: string | undefined = urls[i].split('/').pop();

                // just in case sanity check
                if (requestName === undefined) {
                    requestName = 'unknown-' + i;
                }

                cheerioRequest.setMetadata<string>('request-name', requestName as string);
                cheerioRequest.setMetadata<number>('request-index', i);

                // queue up the request we just made
                requestGroup.queue(cheerioRequest);
            }

            console.log('Letting request queue run');
            await requestGroup.run();

            console.log('This request queue has completed');
            resolve();
        },
    );
}

// demonstrate using cheerio for request
cheerioExample().then((): void => {
    console.log('Completed');
});

```