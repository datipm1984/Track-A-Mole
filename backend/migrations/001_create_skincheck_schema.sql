
CREATE TABLE IF NOT EXISTS lesions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    body_site TEXT,
    notes TEXT,
    first_observed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lesion_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesion_id UUID NOT NULL
        REFERENCES lesions(id) ON DELETE CASCADE,
    object_key TEXT NOT NULL UNIQUE,
    captured_at TIMESTAMPTZ,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesion_id UUID NOT NULL
        REFERENCES lesions(id) ON DELETE CASCADE,
    photo_id UUID
        REFERENCES lesion_photos(id) ON DELETE SET NULL,
    model_name TEXT,
    model_version TEXT,
    risk_level TEXT CHECK (
        risk_level IS NULL OR
        risk_level IN (
            'low', 'moderate', 'high', 'inconclusive'
        )
    ),
    result_summary TEXT,
    result_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    disclaimer_version TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lesions_user_created
    ON lesions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_photos_lesion_captured
    ON lesion_photos (lesion_id, captured_at DESC);

CREATE INDEX IF NOT EXISTS idx_assessments_lesion_created
    ON assessments (lesion_id, created_at DESC);
