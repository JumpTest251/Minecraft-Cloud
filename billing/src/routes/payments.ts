import express, { Request, Response } from 'express';

import { accountExists } from '../middleware/models';
import { paypalProvider } from '../payment/PaypalProvider';
import { PaymentService } from '../payment/PaymentService';

const router = express.Router();

router.post('/:id/paypal', [accountExists], async (req: Request, res: Response) => {
    if (req.user!.userId !== req.params.id) {
        return res.status(403).send({ error: 'Forbidden' });
    }

    let paymentDetails;

    try {
        paymentDetails = await paypalProvider.captureOrder(req.body.orderId);
    } catch (err) {
        console.log('Payment process failed: ' + err.message);

        const parsed = JSON.parse(err.message);
        return res.status(400).send({ error: parsed.details[0].issue });
    }

    await new PaymentService(req.account!).processPrepay(paymentDetails);

    res.send({ message: 'Payment processed' });
});




export { router as paymentRouter };
