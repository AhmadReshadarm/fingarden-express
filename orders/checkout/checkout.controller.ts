import webpush from 'web-push';
import { Role } from '../../core/enums/roles.enum';
import { Request, Response, NextFunction } from 'express';
import { singleton } from 'tsyringe';
import { Controller, Delete, Get, Middleware, Post, Put } from '../../core/decorators';
import { Checkout, Subscription } from '../../core/entities';
import { HttpStatus } from '../../core/lib/http-status';
import { validation } from '../../core/lib/validator';
import { isAdmin, isUser, verifyToken } from '../../core/middlewares';
import { createInvoice } from '../../orders/functions/createInvoice';
import { sendInvoice } from '../../orders/functions/send.mail';
import { CheckoutService } from './checkout.service';
import { invoiceTamplate } from '../functions/invoice.tamplate';

@singleton()
@Controller('/checkouts')
export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}

  @Get()
  @Middleware([verifyToken, isUser])
  async getCheckouts(req: Request, resp: Response) {
    // if (resp.locals.user.role !== Role.Admin) {
    //   req.query.userId = String(resp.locals.user.id);
    // }
    const { jwt } = resp.locals;
    const checkouts = await this.checkoutService.getCheckouts(req.query, req.headers.authorization!, jwt.id);

    resp.json(checkouts);
  }

  @Get('all')
  @Middleware([verifyToken, isAdmin])
  async getAllCheckouts(req: Request, resp: Response) {
    const checkouts = await this.checkoutService.getAllCheckouts(req.query, req.headers.authorization!);

    resp.json(checkouts);
  }

  @Get(':id')
  @Middleware([verifyToken, isUser])
  async getCheckout(req: Request, resp: Response) {
    const { id } = req.params;
    const checkout = await this.checkoutService.getCheckout(id, req.headers.authorization!);

    resp.json(checkout);
  }

  @Post()
  @Middleware([verifyToken, isUser])
  async createCheckout(req: Request, resp: Response) {
    const newCheckout = new Checkout(req.body);
    newCheckout.userId = resp.locals.user.id;
    const { jwt } = resp.locals;
    let created: any;
    try {
      await validation(newCheckout);
    } catch (error) {
      console.log(`validation faild: ${error}`);
    }
    try {
      created = await this.checkoutService.createCheckout(newCheckout);
      resp.status(HttpStatus.CREATED).json(created);
    } catch (error) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `saving order faild: ${error}` });
    }
    try {
      const invoiceData: any = await createInvoice(created!, jwt.name);
      sendInvoice(invoiceTamplate(invoiceData), jwt.email);
      console.log('invoice send succsfuly');
    } catch (error) {
      console.log(`sending invoice faild: ${error}`);
    }
    let payload;
    let subscrition;
    try {
      subscrition = await this.checkoutService.getSubscribers();
      payload = JSON.stringify({
        title: `Заказ №: ${created?.id}`,
        message: `Сума: ${created?.totalAmount}`,
        url: `https:wuluxe.ru/admin/checkouts/${created?.id}`,
      });
    } catch (error) {
      console.log(`getting subscribers faild: ${error}`);
    }
    if (!subscrition || subscrition.length === 0) return;
    const publicKey = 'BHgZBD9sPAjR-YEMwJoULsE5xve8Ezj5XrAw155-KkwksuL6S2CnJt-dddWJg_Q9r_oAEJzQBeOG9oMXz9Sir9Y';
    const privateKey = 'L7DfNF3YlKeMgxWyGl1eJ-em7L7Bsh0DxfNdE4kyeY0';
    webpush.setVapidDetails('mailto:checkout@wuluxe.ru', publicKey, privateKey);
    for (let i = 0; i < subscrition.length; i++) {
      try {
        webpush.sendNotification(JSON.parse(`${subscrition[i].subscriber}`), payload);
      } catch (error) {
        await this.checkoutService.removeSubscriber(subscrition[i].id);
        console.log(`sending notification faild: ${error}`);
      }
    }
  }

  @Post('subscribe')
  @Middleware([verifyToken, isAdmin])
  async createSubscriber(req: Request, resp: Response, next: NextFunction) {
    try {
      const subscrition = await this.checkoutService.getSubscribers();
      if (subscrition && subscrition.length !== 0) {
        for (let i = 0; i < subscrition.length; i++) {
          if (subscrition[i].subscriber === req.body.subscriber) {
            resp.status(HttpStatus.ACCEPTED).json({ message: 'Your are all set' });
            return;
          }
        }
      }
    } catch (error) {
      next();
    }

    try {
      const newSubscrition = await validation(new Subscription({ subscriber: req.body.subscriber }));
      const created = await this.checkoutService.createSubscriber(newSubscrition);
      resp.status(HttpStatus.OK).json(created);
    } catch (error) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `somthing went wrong: ${error}` });
    }
  }

  @Put('refreshpushsubscription')
  @Middleware([verifyToken, isAdmin])
  async updatedSubscriber(req: Request, resp: Response) {
    try {
      const updated = await this.checkoutService.updateSubscriber(JSON.stringify(req.body.oldSubscription), {
        id: '',
        subscriber: JSON.stringify(req.body.newSubscription),
      });
      resp.status(HttpStatus.OK).json(updated);
    } catch (error) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `somthing went wrong: ${error}` });
    }
  }

  @Put(':id')
  @Middleware([verifyToken, isUser])
  async updateCheckout(req: Request, resp: Response) {
    const { id } = req.params;
    const { jwt } = resp.locals;
    try {
      const checkoutsById = await this.checkoutService.getCheckout(id, req.headers.authorization!);
      if (!checkoutsById) {
        resp.status(HttpStatus.NOT_FOUND).json({ message: 'Not found!' });
        return;
      }
      const timeCheck = (orderDate: any) => {
        const oneDay = 24 * 60 * 60 * 1000;
        const currentDate = new Date().getTime();
        const dateOnDB = new Date(orderDate).getTime() + oneDay;
        return currentDate >= dateOnDB;
      };

      if (timeCheck(checkoutsById.createdAt) && jwt.role !== Role.Admin) {
        resp.status(HttpStatus.REQUEST_TIMEOUT).json({ message: 'request timedout' });
        return;
      }
      if (jwt.role !== Role.Admin) {
        req.body.sattus = checkoutsById.status;
        const usedrCheckoutUpdated = await this.checkoutService.updateCheckout(id, req.body, resp.locals.user);
        resp.status(HttpStatus.OK).json(usedrCheckoutUpdated);
        return;
      }
      const updated = await this.checkoutService.updateCheckout(id, req.body, resp.locals.user);

      resp.status(HttpStatus.OK).json(updated);
    } catch (error) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `somthing went wrong: ${error}` });
    }
  }

  @Delete(':id')
  @Middleware([verifyToken, isAdmin])
  async removeCheckout(req: Request, resp: Response) {
    const { id } = req.params;
    const removed = await this.checkoutService.removeCheckout(id, resp.locals.user);

    resp.status(HttpStatus.OK).json(removed);
  }
}
