import { createClient } from '@supabase/supabase-js'

// La "clave publicable" está diseñada para exponerse en el navegador: la
// lectura es pública a propósito (igual que el JSON estático anterior) y
// toda escritura pasa por funciones RPC que validan la clave de
// administrador del lado del servidor (ver supabase/schema.sql).
const SUPABASE_URL = 'https://mkmxieowzcnddnsvgojt.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_-ROJ_r39Z4ySXc7gXF8soQ_PhPQvf47'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
