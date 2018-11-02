/*
** Author: Sylvain Garant
** Website: https://github.com/Xobtah
*/

module.exports = function (data, links, socket) {
    if (!links.has(data.link_id))
        return ;
    links.get(data.link_id).forEach((link) => {
        if (link.socket !== socket)
            link.socket.emit('data', { link_id: data.link_id, body: { module: data.body.module, value: data.body.value } });
    });
    console.log('Data from ' + data.link_id + ': ' + data.body.value);
};
