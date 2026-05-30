import { describe, it, expect } from '@jest/globals';
import { AppController } from './app.controller';



/* ══════════════════════════════════════════════════════════════════════════════
   AppController — Unit Tests
   ══════════════════════════════════════════════════════════════════════════════ */

describe('AppController', () => 
{
    let controller: AppController;


    beforeEach(() => 
    {
        controller = new AppController();
    });



    /* ─────────────────────── checkHealth ─────────────────────── */

    describe('checkHealth', () => 
    {
        it('ar trebui să returneze statusul "ok" și numele aplicației', () => 
        {
            const result = controller.checkHealth();

            expect(result).toEqual({
                status: 'ok',
                name: 'Dev Bluelock v0.0',
            });
        });
    });
});
