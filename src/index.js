export default {
	async email(message, env) {
		// Extract sender, recipient, subject, and body
		const sender = message.from;
		const recipient = message.to;
		const subject = message.headers.get('subject') || 'No Subject';
		const body = await message.text();

		// Use regex to extract the part before '@' in the recipient email
		const match = recipient.match(/^([^@]+)@/);
		const recipientKeyPart = match ? match[1] : 'unknown';
	
		// Use the recipient's email address as the key
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
			`Email from ${sender} to ${recipient} with subject "${subject}" saved successfully!`,
			{ status: 200 }
		);
	},
};
