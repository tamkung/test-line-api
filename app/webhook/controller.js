const connection = require("../config/db.config");
const { default: axios } = require('axios');

exports.addUser = (userId) => {
    const line_user_id = userId;
    try {
        axios.get(`https://api.line.me/v2/bot/profile/${line_user_id}`, {
            headers: {
                Authorization: `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`
            },
        }).then((response) => {
            console.log(response.data);
            const { displayName, pictureUrl } = response.data;
            connection.query('SELECT * FROM contact_line WHERE line_user_id = ?', [line_user_id], (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    if (results.length > 0) {
                        console.log('LineUserID already exists.');
                    } else {
                        connection.query('INSERT INTO contact_line (line_user_id, display_name) VALUES (?, ?)', [line_user_id, displayName], (error, results) => {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Add LineUserID Success.');
                                axios.post('https://api.line.me/v2/bot/message/push', {
                                    to: line_user_id,
                                    messages: [
                                        {
                                            type: 'text',
                                            text: 'สวัสดีครับ คุณ ' + displayName + ' บันทึก LineUserID ของคุณเรียบร้อยแล้ว'
                                        }
                                    ]
                                }, {
                                    headers: {
                                        Authorization: `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`
                                    },
                                }).then((response) => {
                                    console.log('Send Message Success.');
                                }).catch((error) => {
                                    console.log(error);
                                });
                            }
                        });
                    }
                }
            });
        }).catch((error) => {
            res.status(500).json({ error });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!!!' });
    };
}

exports.deleteUser = (userId) => {
    try {
        connection.query('DELETE FROM contact_line WHERE line_user_id = ?', [userId], (error, results) => {
            if (error) {
                console.log(error);
            } else {
                console.log('Delete LineUserID Success.');
            }
        });
    } catch (error) {
        console.log(error);
    }
}

exports.logEvents = (userId, events, type) => {
    try {
        connection.query('INSERT INTO log_events (user_id, events, type) VALUES (?, ?, ?)', [userId, JSON.stringify(events), type], (error, results) => {
            if (error) {
                console.log(error);
            } else {
                console.log('Log Events Success.');
            }
        });
    } catch (error) {
        console.log(error);
    }
}