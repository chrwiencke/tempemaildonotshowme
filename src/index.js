export default {
	async email(message, env) {
		// Log the message to inspect its structure
		console.log(message);

		// Extract sender, recipient, subject, and body
		const sender = message.from;
		const recipient = message.to;
		const subject = message.headers.get('subject') || 'No Subject';

		// If 'raw' contains the email body as text
		const body = message.raw || 'No Body Content';

		// Use regex to extract the part before '@' in the recipient email
		const match = recipient.match(/^([^@]+)@/);
		const recipientKeyPart = match ? match[1] : 'unknown';

		// Use the extracted part as part of the key
		const key = `email:${recipientKeyPart}`;

		// Construct the data object
		const emailData = {
			sender,
			recipient,
			subject,
			body,
			timestamp: new Date().toISOString(),
		};

		// Save the email data to KV
		await env.EMAIL_STORE.put(key, JSON.stringify(emailData));
	
		// Return a response to acknowledge the email
		return new Response(
			`Email from ${sender} to ${recipient} (key: ${recipientKeyPart}) with subject "${subject}" saved successfully!`,
			{ status: 200 }
		);
	},
};
