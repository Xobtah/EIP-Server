/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

module.exports = function (data, links, socket) {
    if (!links.has(data.link_id))
        return ;
    links.get(data.link_id).forEach((link) => {
        if (link.socket !== socket)
            link.socket.emit('data', { link_id: data.link_id, module: data.module, body: { value: data.body.value } });
    });
};
