const connection = new RTCMultiConnection();
connection.socketURL = 'https://muazkhan.com:9001/';

connection.session = {
    audio: true,
    video: true,
    oneway: true
};

connection.sdpConstraints = {
    mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    },
    optional: []
};

export { connection };