/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

module.exports = {
    // register (data, links) {
    //     links.set(data.link_id, {
    //         type: data.body.type || null,
    //         links: [],
    //         socket
    //     });
    // },
    link (data, links, socket) {
        if (links.has(data.link_id)) {
            links.get(data.link_id).push({ type: data.body.type, socket });
            links.get(data.link_id).forEach((link) => {
                if (link.socket !== socket)
                    link.socket.emit('link', { link_id: data.link_id, body: { type: data.body.type } });
            });
        }
        else
            links.set(data.link_id, [ { type: data.body.type, socket } ]);
    },
    start_game (data, links, socket) {
        if (links.has(data.link_id))
            links.get(data.link_id).forEach((link) => {
                if (link.socket !== socket)
                    link.socket.emit('command', { link_id: data.link_id, body: { command: 'start_game' } });
            });
    },
    end_game (data, links, socket) {
        if (links.has(data.link_id))
            links.get(data.link_id).forEach((link) => {
                if (link.socket !== socket)
                    link.socket.emit('command', { link_id: data.link_id, body: { command: 'end_game' } });
            });
    }
};
