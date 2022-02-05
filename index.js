// defind params
const inputFundName = process.argv.slice(2)?.[0];

if (!inputFundName) {
	return console.log('Please provide Fund name..');
}

// start app
const http = require("http");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const options = {
	host: 'codequiz.azurewebsites.net',
	method: 'GET',
	headers: {
		Cookie: 'hasCookie=true',
	},
};

const scraperWebPage = (fundName) => {
	if (!fundName) {
		return null;
	}

	return new Promise((resolve, reject) => {
		http.request(options, (res) => {
			res.setEncoding('utf8');

			res.on('data', (html) => {
				const dom = new JSDOM(html);
				// use :not(:first-child) for ignore header
				const data = Array.from(dom.window.document.querySelectorAll('tr:not(:first-child)')).map((tr) => {
					const transformedToText = Array.from(tr.children).map((span) => span.textContent);
					const [
						name,
						nav,
						bid,
						offer,
						change,
					] = transformedToText;

					return {
						name,
						nav,
						bid,
						offer,
						change,
					};
				})

				resolve(data.find((fund) => fund.name === fundName) ?? null);
			});
		})
		.on('error', (e) => {
			reject(`problem with request: ${e.message}`);
		})
		.end();
	});
}

(async () => {
	try {
		console.log((await scraperWebPage(inputFundName))?.nav ?? 'Not found.');
	} catch (error) {
		console.log(error);
	}
})();