/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

module.exports = {
    link (data, links, socket) {
        socket.link_id = data.link_id;
        if (links.has(data.link_id)) {
            links.get(data.link_id).push({ type: data.body.type, socket });
            links.get(data.link_id).forEach((link) => {
                if (link.socket !== socket)
                    link.socket.emit('link', { link_id: data.link_id, body: { type: data.body.type } });
            });
        }
        else
            links.set(data.link_id, [ { type: data.body.type, socket } ]);
        console.log('Link: ' + data.link_id);
	socket.emit('info', 'Linked with id \'' + data.link_id + '\'');
    },
    start_game (data, links, socket) {
        if (links.has(data.link_id))
            links.get(data.link_id).forEach((link) => {
                if (link.socket !== socket)
                    link.socket.emit('command', { link_id: data.link_id, body: { command: 'start_game' } });
            });
        console.log(data.link_id + ': Game started');
	socket.emit('info', 'Game started');
    },
    end_game (data, links, socket) {
        if (links.has(data.link_id))
            links.get(data.link_id).forEach((link) => {
                if (link.socket !== socket)
                    link.socket.emit('command', { link_id: data.link_id, body: { command: 'end_game' } });
            });
        console.log(data.link_id + ': Game ended');
	socket.emit('info', 'Game ended');
    }
};
