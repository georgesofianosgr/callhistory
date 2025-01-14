CREATE TABLE IF NOT EXISTS CallEvent (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL,
  from_number VARCHAR(255) NOT NULL,
  to_number VARCHAR(255) NOT NULL,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP NOT NULL,
)
  
CONSTRAINT "CallEvent_pkey" PRIMARY KEY ("id")
