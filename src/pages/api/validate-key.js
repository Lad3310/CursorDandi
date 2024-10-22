import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { apiKey } = req.body;

    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('key', apiKey)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        // API key is valid
        res.status(200).json({ valid: true });
      } else {
        // API key is not found
        res.status(200).json({ valid: false });
      }
    } catch (error) {
      console.error('Error validating API key:', error);
      res.status(500).json({ error: 'Error validating API key' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
