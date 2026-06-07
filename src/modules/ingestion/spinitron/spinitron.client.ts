import { SPINITRON_PERSONA_URL } from "~/shared/consts/consts";
import { Persona } from "~/shared/entities/persona.entity";

function normalizeHtmlText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<\/?[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function fetchPersonaFromSpinitron(
  personaId: string,
): Promise<Persona> {
  const id = personaId;

  const url = `${SPINITRON_PERSONA_URL}/${id}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'text/html',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Spinitron persona page: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();
  const match = html.match(/<div[^>]*class="[^"]*\bhead\b[^"]*\bpersona\b[^"]*"[^>]*>[\s\S]*?<h1[^>]*>([\s\S]*?)<\/h1>/i);

  if (!match) {
    throw new Error(`Persona name not found in Spinitron HTML for id=${id}`);
  }

  const name = normalizeHtmlText(match[1]);
  if (!name) {
    throw new Error(`Parsed empty persona name for id=${id}`);
  }

  const persona = new Persona();
  persona.id = id;
  persona.name = name;
  return persona;
}

export async function fetchPersonasFromSpinitronIds(
  personaIds: string[],
): Promise<Persona[]> {
  return Promise.all(personaIds.map((id) => fetchPersonaFromSpinitron(id)));
}