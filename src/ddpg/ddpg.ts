
export class DDPG {
    actor: any;
    critic: any;
    memory: any;
    noise: any;
    config: any;
    constructor(actor: any, critic: any, memory: any, noise: any, config: any) {
        this.actor = actor;
        this.critic = critic;
        this.memory = memory;
    }
}