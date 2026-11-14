import { describe, expect, it } from 'vitest';
import { EN } from '../i18n/en';
import { ES } from '../i18n/es';
import { EU } from '../i18n/eu';
import { IT } from '../i18n/it';
import { UK } from '../i18n/uk';
import { guidesFor, INSTALL_GUIDES, INSTALL_PLATFORMS } from './install-guides';

describe('install guides', () => {
  it('has a text for every step, in every language', () => {
    for (const messages of [EN, ES, EU, IT, UK]) {
      for (const guide of INSTALL_GUIDES) {
        expect(messages.install.guides[guide.id].steps).toHaveLength(guide.pictures.length);
      }
    }
  });

  it('gives every platform at least one guide', () => {
    for (const platform of INSTALL_PLATFORMS) {
      expect(guidesFor(platform).length).toBeGreaterThan(0);
    }
  });
});
