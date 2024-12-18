const PostalMime = require('postal-mime');

export default {
	async email(message, env) {
		try {
			// Extract sender, recipient, and subject
			const sender = message.from;
			const recipient = message.to;
			const subject = message.headers.get('subject') || 'No Subject';

			// Get email content
			let rawEmail = new Response(message.raw);
			let arrayBuffer = await rawEmail.arrayBuffer();
			const parser = new PostalMime.default();
			const email = await parser.parse(arrayBuffer);
			const rawBody = email.html || email.text;

			// Extract the recipient key from the email address
			const match = recipient.match(/^([^@]+)@/);
			const recipientKeyPart = match ? match[1] : 'unknown';
			const key = `${recipientKeyPart}`;

			// Construct the email data to store
			const emailData = {
				sender,
				recipient,
				subject,
				body: rawBody,
				timestamp: new Date().toISOString(),
			};

			// Save the email data to KV store
			await env.EMAIL_STORE.put(key, JSON.stringify(emailData), { expirationTtl: 3600 });

			// Count emails recieved
			const countKey = "request_count";
			let count = await env.ANALYTICS_STORE.get(countKey);
			count = count ? parseInt(count, 10) : 0;
			count += 1;
			await env.ANALYTICS_STORE.put(countKey, count.toString());
			
			// Use the sender as the key for the sender's count
			let countOfSender = await env.ANALYTICS_STORE.get(sender);
			countOfSender = countOfSender ? parseInt(countOfSender, 10) : 0;
			countOfSender += 1;
			await env.ANALYTICS_STORE.put(sender, countOfSender.toString()); 


			// Return a success response
			return new Response(`Email from ${sender} to ${recipient} saved with key "${key}".`, { status: 200 });
		} catch (error) {
			console.error('Error processing email:', error);
			return new Response('Failed to process email.', { status: 500 });
		}
	},
};
