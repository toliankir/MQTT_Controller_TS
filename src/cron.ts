import cron from 'node-cron';
import arhive from './sql_storage';
import state from './state';
import logger from './logger';

export function cronStart() {
    logger.log({
        level: 'info',
        message: 'Cron: Init cron tasks'
    })
    cron.schedule('*/15 * * * *', () => {
        logger.log({
            level: 'info',
            message: 'Cron: Start cron task: saving sensors state to DB.'
        })
        arhive.saveState(state.getStorage(),['sensor']);
    });
}