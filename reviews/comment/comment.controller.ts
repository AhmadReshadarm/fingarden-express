import { Request, Response } from 'express';
import { singleton } from 'tsyringe';
import { HttpStatus } from '../../core/lib/http-status';
import { CommentService } from './comment.service';
import { Controller, Delete, Get, Middleware, Post, Put } from '../../core/decorators';
import { isUser, verifyToken } from '../../core/middlewares';
import { ReactionComment } from '../../core/entities';
import { validation } from '../../core/lib/validator';

@singleton()
@Controller('/comments')
export class CommentController {
  constructor(private commentService: CommentService) { }

  @Get()
  async getComments(req: Request, resp: Response) {
    const comments = await this.commentService.getComments(req.query);

    resp.json(comments);
  }

  @Get(':id')
  @Middleware([verifyToken, isUser])
  async getComment(req: Request, resp: Response) {
    const { id } = req.params;
    const comment = await this.commentService.getComment(id, req.headers.authorization!);

    resp.json(comment);
  }

  @Post()
  @Middleware([verifyToken, isUser])
  async createComment(req: Request, resp: Response) {
    req.body.userId = resp.locals.user.id;
    const created = await this.commentService.createComment(req.body);

    resp.status(HttpStatus.CREATED).json(created);
  }

  @Post('reaction')
  @Middleware([verifyToken, isUser])
  async createReaction(req: Request, resp: Response) {
    req.body.userId = resp.locals.user.id;

    const reaction = new ReactionComment(req.body)
    reaction.id = await this.commentService.getNewReactionId()
    await validation(reaction)

    const created = await this.commentService.createReaction(reaction);

    resp.status(HttpStatus.CREATED).json(created);
  }

  @Put(':id')
  @Middleware([verifyToken, isUser])
  async updateComment(req: Request, resp: Response) {
    const { id } = req.params;
    const updated = await this.commentService.updateComment(
      id,
      req.body,
      resp.locals.user,
      req.headers.authorization!
    );

    resp.status(HttpStatus.OK).json(updated);
  }

  @Delete(':id')
  @Middleware([verifyToken, isUser])
  async removeComment(req: Request, resp: Response) {
    const { id } = req.params;
    const removed = await this.commentService.removeComment(id, resp.locals.user);

    resp.status(HttpStatus.OK).json(removed);
  }

  @Delete('reaction/:id')
  @Middleware([verifyToken, isUser])
  async removeReaction(req: Request, resp: Response) {
    const { id } = req.params;
    const removed = await this.commentService.removeReaction(id, resp.locals.user);

    console.log(removed);

    resp.status(HttpStatus.OK).json(removed);
  }
}
