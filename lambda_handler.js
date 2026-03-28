exports.handler = async (event) => {
    const action = event.directive.payload.action;
    const n8n_url = "https://YOUR_N8N_INSTANCE/alexa-plus-trigger";
    
    await fetch(n8n_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: action, source: 'alexa-voice' })
    });
    
    return { event: { header: { namespace: "Alexa", name: "Response" }, payload: {} } };
};
