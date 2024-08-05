import {describe, expect, test} from '@jest/globals';
import PixelData from '../PixelData';
import LWWMap from '../LWWMap';
import { RGB } from '../types';

describe('PixelData', () => {

    test('new PixelData instance', () => {
      const id = 'customId';
      const pixelData = new PixelData(id);
      expect(pixelData.id).toBe(id);
    });

    test('key', () => {
      const x = 1;
      const y = 2;
      const key = PixelData.key(x, y);
      expect(key).toBe(`${x},${y}`);
    });

  // While you could write tests for the remaining methods, the observant reader will notice that they are all wrappers for LWWMap methods. Hence, they are not tested here.
 });
