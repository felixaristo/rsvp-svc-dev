import { ValueTransformer } from 'typeorm';

export class FileUrlTransformer implements ValueTransformer {
  to(value: string | null): string | null {
    if (!value) return value;
    const baseUrl = process.env.APP_BASE_URL;
    if (baseUrl && value.startsWith(baseUrl)) {
      return value.replace(baseUrl, '');
    }
    return value;
  }

  from(value: string | null): string | null {
    if (!value) return value;
    const baseUrl = process.env.APP_BASE_URL;
    if (baseUrl && !value.startsWith('http')) {
      // Ensure baseUrl ends with / and value doesn't start with / to avoid double slashes,
      // OR just simple concatenation if we trust the inputs.
      // Let's do a safe join.
      const safeBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      const safeValue = value.startsWith('/') ? value.substring(1) : value;
      return `${safeBase}${safeValue}`;
    }
    return value;
  }
}
