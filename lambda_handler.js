exports.handler = async (event) => {
    const directive = event.directive || {};
    const payload = directive.payload || {};
    const action = payload.action;
    const viewName = payload.view;

    const n8n_url = "https://YOUR_N8N_INSTANCE/alexa-plus-trigger";
    const n8n_view_url = "https://YOUR_N8N_INSTANCE/echo-show-view-assist";

    // Detect Echo Show / APL-capable device
    const hasDisplay = (
        event.context &&
        event.context.System &&
        event.context.System.device &&
        event.context.System.device.supportedInterfaces &&
        event.context.System.device.supportedInterfaces['Alexa.Presentation.APL']
    );

    // Route view-assist commands to Echo Show webhook
    if (viewName) {
        await fetch(n8n_view_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ view: viewName, device: 'echo-show', source: 'alexa-voice' })
        });

        const aplDirective = hasDisplay ? {
            type: "Alexa.Presentation.APL.RenderDocument",
            token: "echo-show-view-assist",
            document: {
                type: "APL",
                version: "1.8",
                mainTemplate: {
                    items: [{
                        type: "Container",
                        backgroundColor: "#0a0a0a",
                        items: [
                            {
                                type: "Text",
                                text: viewName.replace(/-/g, ' ').toUpperCase(),
                                color: "#a78bfa",
                                fontSize: "28dp",
                                fontWeight: "bold",
                                paddingTop: "20dp",
                                paddingLeft: "20dp"
                            },
                            {
                                type: "Text",
                                text: "Alexa+ View Assist | MumCare",
                                color: "#888888",
                                fontSize: "18dp",
                                paddingLeft: "20dp",
                                paddingTop: "8dp"
                            }
                        ]
                    }]
                }
            }
        } : null;

        return {
            event: {
                header: { namespace: "Alexa", name: "Response" },
                payload: {}
            },
            response: {
                outputSpeech: { type: "PlainText", text: "View Assist updated on Echo Show." },
                directives: aplDirective ? [aplDirective] : []
            }
        };
    }

    // Standard action routing
    await fetch(n8n_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: action, source: 'alexa-voice' })
    });

    return { event: { header: { namespace: "Alexa", name: "Response" }, payload: {} } };
};
