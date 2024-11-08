exports.getID = function() {
    const os = require('os')

    const nets = os.networkInterfaces();
    // console.log(nets);
    const results = Object.create(null);
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
        if (net.family === familyV4Value && !net.internal) {
          if (!results[name]) {
            results[name] = [];
          }
          results[name].push(net.mac);
        }
      }
    }
    
    function mac2id(mac) {
        return mac.replace(/:/g, '').substring(6)
    }
    
    id = ''
    const type = os.type();
    if (type.startsWith('Windows')) {
        if ('Ethernet' in results) {
            id = mac2id(results['Ethernet'][0])
        } else if ('Wi-Fi' in results) {
            id = mac2id(results['Wi-Fi'][0])
        }
    } else if (type.startsWith('Linux')) {
    
    } else if (type.startsWith('Darwin')) {
        if ('en0' in results) {
            id = mac2id(results['en0'][0])
        }
    } else {
        id = '?'
    }
    // console.log('ID:', id)
    return id
}
