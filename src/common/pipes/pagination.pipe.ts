import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class PaginationPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        const page = parseInt(value.page) || 1;
        const limit = Math.min(parseInt(value.limit) || 20, 100);
        return { page, limit };
    }
}
