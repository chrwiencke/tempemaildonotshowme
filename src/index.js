export default {
	async email(message, env) {
		// Log the message to inspect its structure
		console.log(message);

		// Extract sender, recipient, subject, and body
		const sender = message.from;
		const recipient = message.to;
		const subject = message.headers.get('subject') || 'No Subject';

		 // Get email body - try text first, fallback to raw
		const body = message.text || await message.raw.text() || 'No body content';

		// Use regex to extract the part before '@' in the recipient email
		const match = recipient.match(/^([^@]+)@/);
		const recipientKeyPart = match ? match[1] : 'unknown';

		// Use the extracted part as part of the key
		const key = `${recipientKeyPart}`;

		// Construct the data object
		const emailData = {
			sender,
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
