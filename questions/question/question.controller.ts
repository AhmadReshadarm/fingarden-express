import { Request, Response } from 'express';
import { singleton } from 'tsyringe';
import { Question } from '../../core/entities';
import { HttpStatus } from '../../core/lib/http-status';
import { validation } from '../../core/lib/validator';
import { QuestionService } from './question.service';
import { Controller, Delete, Get, Middleware, Post, Put } from '../../core/decorators';
import { isAdmin, isUser, verifyToken } from '../../core/middlewares';
import { CreateReactionDTO } from '../questions.dtos';

@singleton()
@Controller('/questions')
export class QuestionController {
  constructor(private questionService: QuestionService) { }

  @Get()
  async getQuestions(req: Request, resp: Response) {
    const questions = await this.questionService.getQuestions(req.query);
    resp.json(questions);
  }

  @Get(':id')
  @Middleware([verifyToken, isUser])
  async getQuestion(req: Request, resp: Response) {
    const { id } = req.params;
    const question = await this.questionService.getQuestion(id);

    resp.json(question);
  }

  @Post()
  @Middleware([verifyToken, isUser])
  async createQuestion(req: Request, resp: Response) {
    const newQuestion = new Question(req.body);
    newQuestion.userId = resp.locals.user.id;

    await validation(newQuestion);
    const created = await this.questionService.createQuestion(newQuestion);

    resp.status(HttpStatus.CREATED).json(created);
  }

  @Post('reaction')
  @Middleware([verifyToken, isUser])
  async createReaction(req: Request, resp: Response) {
    req.body.userId = resp.locals.user.id;

    const reaction: CreateReactionDTO = req.body;
    reaction.id = await this.questionService.getNewReactionId();
    await validation(reaction);

    const created = await this.questionService.createReaction(reaction);

    resp.status(HttpStatus.CREATED).json(created);
  }

  @Put(':id')
  @Middleware([verifyToken, isAdmin])
  async updateReview(req: Request, resp: Response) {
    const { id } = req.params;

    const updated = await this.questionService.updateQuestion(id, req.body, resp.locals.user);

    resp.status(HttpStatus.OK).json(updated);
  }

  @Delete(':id')
  @Middleware([verifyToken, isUser])
  async removeQuestion(req: Request, resp: Response) {
    const { id } = req.params;
    const removed = await this.questionService.removeQuestion(id);

    console.log(removed, 123123213);

    resp.status(HttpStatus.OK).json(removed);
  }

  @Delete('reaction/:id')
  @Middleware([verifyToken, isUser])
  async removeReaction(req: Request, resp: Response) {
    const { id } = req.params;
    const removed = await this.questionService.removeReaction(id, resp.locals.user);

    resp.status(HttpStatus.OK).json(removed);
  }
}
