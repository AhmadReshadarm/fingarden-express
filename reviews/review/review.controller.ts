import { Request, Response } from 'express';
import { singleton } from 'tsyringe';
import { ReactionReview, Review } from '../../core/entities';
import { HttpStatus } from '../../core/lib/http-status';
import { validation } from '../../core/lib/validator';
import { ReviewService } from './review.service';
import { Controller, Delete, Get, Middleware, Post, Put } from '../../core/decorators';
import { isUser, verifyToken } from '../../core/middlewares';
import { Role } from '../../core/enums/roles.enum';
import { CreateReactionDTO } from '../reviews.dtos';

@singleton()
@Controller('/reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) { }

  @Get()
  async getReviews(req: Request, resp: Response) {
    const reviews = await this.reviewService.getReviews(req.query);

    resp.json(reviews);
  }

  @Get(':id')
  @Middleware([verifyToken, isUser])
  async getReview(req: Request, resp: Response) {
    const { id } = req.params;
    const review = await this.reviewService.getReview(id, req.headers.authorization!);

    resp.json(review);
  }

  @Post()
  @Middleware([verifyToken, isUser])
  async createReview(req: Request, resp: Response) {
    const newReview = new Review(req.body);
    newReview.userId = resp.locals.user.id;

    if (resp.locals.user.role != Role.Admin) {
      newReview.showOnMain = false;
    }

    await validation(newReview);
    const created = await this.reviewService.createReview(newReview, req.headers.authorization!);

    resp.status(HttpStatus.CREATED).json(created);
  }

  @Post('reaction')
  @Middleware([verifyToken, isUser])
  async createReaction(req: Request, resp: Response) {
    req.body.userId = resp.locals.user.id;

    const reaction: CreateReactionDTO = req.body
    reaction.id = await this.reviewService.getNewReactionId()
    await validation(reaction)

    const created = await this.reviewService.createReaction(reaction);

    resp.status(HttpStatus.CREATED).json(created);
  }

  @Put(':id')
  @Middleware([verifyToken, isUser])
  async updateReview(req: Request, resp: Response) {
    const { id } = req.params;

    if (resp.locals.user.role != Role.Admin) {
      req.body.showOnMain = undefined;
    }

    const updated = await this.reviewService.updateReview(id, req.body, resp.locals.user);

    resp.status(HttpStatus.OK).json(updated);
  }

  @Delete(':id')
  @Middleware([verifyToken, isUser])
  async removeReview(req: Request, resp: Response) {
    const { id } = req.params;
    const removed = await this.reviewService.removeReview(id, resp.locals.user);

    resp.status(HttpStatus.OK).json(removed);
  }

  @Delete('reaction/:id')
  @Middleware([verifyToken, isUser])
  async removeReaction(req: Request, resp: Response) {
    const { id } = req.params;
    const removed = await this.reviewService.removeReaction(id, resp.locals.user);

    resp.status(HttpStatus.OK).json(removed);
  }
}
