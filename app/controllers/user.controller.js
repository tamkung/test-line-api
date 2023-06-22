const bcrypt = require('bcrypt');

const connection = require("../config/db.config");
const { default: axios } = require('axios');

exports.addUser = async (req, res) => {
    try {
        const { line_user_id } = req.body;
        axios.get(`https://api.line.me/v2/bot/profile/${line_user_id}`, {
            headers: {
                Authorization: `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`
            },
        }).then((response) => {
            const { displayName, pictureUrl } = response.data;
            connection.query('SELECT * FROM contact_line WHERE line_user_id = ?', [line_user_id], (error, results) => {
                if (error) {
                    res.status(500).json({ error });
                } else {
                    if (results.length > 0) {
                        res.status(500).json({ message: 'LineUserID already exists.' });
                    } else {
                        connection.query('INSERT INTO contact_line (line_user_id, display_name) VALUES (?, ?)', [line_user_id, displayName], (error, results) => {
                            if (error) {
                                res.status(500).json({ error });
                            } else {
                                res.send({ message: 'Add LineUserID Success.' });
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
};

exports.getUser = async (req, res) => {
    try {
        connection.query('SELECT * FROM contact_line;', (error, results) => {
            if (error) {
                res.status(500).json({ error });
            } else {
                res.json(results);
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!!!' });
    };
};
