
let client = require("../client").client;

// Fetch all the pods
async function main() {
	return await client.api.v1.namespaces("soajs").pods("dashboard-oauth-v1-785b4b6df8-2nvn6").log.getByteStream({qs: {follow: true, tailLines:400}});
}
//get namespaces
main().then((stream) => {
	
	stream.on("data", (chunk) => {
		//keep on witting to the response
		console.log(chunk.toString());
	});
	stream.on("error", (error) => {
		console.log(error);
	});
	stream.on("end", () => {
		console.log("END");
	});
	
	
}).catch((err) => {
	console.log(err)
});