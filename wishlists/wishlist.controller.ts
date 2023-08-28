import { Request, Response } from 'express';
import { singleton } from 'tsyringe';
import { Controller, Delete, Get, Middleware, Post, Put } from '../core/decorators';
import { Wishlist } from '../core/entities';
import { HttpStatus } from '../core/lib/http-status';
import { validation } from '../core/lib/validator';
import { isAdmin, verifyToken } from '../core/middlewares';
import { WishlistService } from './wishlist.service';

@singleton()
@Controller('/wishlists')
export class WishlistController {
  constructor(private wishlistService: WishlistService) { }

  @Get()
  @Middleware([verifyToken, isAdmin])
  async getWishlists(req: Request, resp: Response) {
    const wishlists = await this.wishlistService.getWishlists(req.query);

    resp.json(wishlists);
  }

  @Get(':id')
  async getWishlist(req: Request, resp: Response) {
    const { id } = req.params;
    const wishlist = await this.wishlistService.getWishlist(id);

    resp.json(wishlist);
  }

  @Get('wishlistProducts/:id')
  async getWishlistProducts(req: Request, resp: Response) {
    const { id } = req.params;
    const products = await this.wishlistService.getWishlistProducts(id);

    resp.json(products);
  }

  @Post()
  async createWishlist(req: Request, resp: Response) {
    const created = await this.wishlistService.createWishlist();

    resp.status(HttpStatus.CREATED).json(created);
  }

  @Put(':id')
  async updateWishlist(req: Request, resp: Response) {
    const { id } = req.params;

    const updated = await this.wishlistService.updateWishlist(id, req.body);

    resp.status(HttpStatus.CREATED).json(updated);
  }

  @Delete(':id')
  async removeWishlist(req: Request, resp: Response) {
    const { id } = req.params;
    const removed = await this.wishlistService.removeWishlist(id);

    resp.status(HttpStatus.OK).json(removed);
  }
}
