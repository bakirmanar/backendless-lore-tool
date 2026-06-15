import { TestBed } from '@angular/core/testing';
import { Marked } from 'marked';

import { ImageExtension } from './image.extension';

describe('ImageExtension', () => {
  let service: ImageExtension;
  let marked: Marked;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageExtension);
    marked = new Marked({
      extensions: [service.buildMarkedConfiguration()],
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should render default markdown image markup', () => {
    expect(marked.parse('![image info](image-url.png)')).toBe(
      '<p><img src="image-url.png" alt="image info"></p>\n',
    );
  });

  it('should render default markdown image title markup', () => {
    expect(marked.parse('![image info](image-url.png "Image title")')).toBe(
      '<p><img src="image-url.png" alt="image info" title="Image title"></p>\n',
    );
  });

  it('should render formatted alt text as plain image alt text', () => {
    expect(marked.parse('![**image** info](image-url.png)')).toBe(
      '<p><img src="image-url.png" alt="image info"></p>\n',
    );
  });

  it('should render image width, height, and left position styles', () => {
    expect(
      marked.parse('![image info](image-url.png){width: 100px, height: 50%, position: left}'),
    ).toBe(
      '<p><img src="image-url.png" alt="image info" style="width: 100px; height: 50%; float: left;"></p>\n',
    );
  });

  it('should render fill line position as a block image', () => {
    expect(marked.parse('![image info](image-url.png){position: fill line}')).toBe(
      '<p><img src="image-url.png" alt="image info" style="display: block; width: 100%;"></p>\n',
    );
  });

  it('should ignore unsupported image options', () => {
    expect(
      marked.parse('![image info](image-url.png){width: 100rem, height: auto, position: center}'),
    ).toBe('<p><img src="image-url.png" alt="image info"></p>\n');
  });
});
