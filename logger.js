exports.Logger = class {
    constructor(name) {
        this.name = name;
    }

    log(level, msg) {
        console.log({'level': level, 'message': msg, 'name': this.name});
    }
    
    info(msg) {
        this.log('INFO', msg);
    }

    debug(msg) {
        this.log('DEBUG', msg);
    }

    error(msg) {
        this.log('ERROR', msg);
    }
}
