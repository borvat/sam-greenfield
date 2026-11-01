-- Fail closed even when a trusted operator updates a proposal directly.
ALTER TABLE company_skill_proposals ADD CONSTRAINT skill_adopter_not_proposer CHECK(adopted_by IS NULL OR adopted_by<>proposed_by);
CREATE FUNCTION company_skill_pin_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='UPDATE' AND (NEW.source_hash,NEW.source_commit,NEW.source_url) IS DISTINCT FROM (OLD.source_hash,OLD.source_commit,OLD.source_url) THEN
  NEW.state:='QUARANTINED';NEW.review:=NULL;NEW.reviewed_by:=NULL;NEW.reviewed_hash:=NULL;NEW.adopted_by:=NULL;
 END IF;
 IF NEW.state IN('REVIEWED','ADOPTED') AND (
  NEW.review IS NULL OR jsonb_typeof(NEW.review->'checks') IS DISTINCT FROM 'object' OR (NEW.review->'checks' @> '{"source":true,"license":true,"dependencies":true,"secrets":true,"isolation":true,"evaluation":true}'::jsonb) IS DISTINCT FROM true
  OR coalesce(length(trim(NEW.review->>'evidence')),0)=0 OR NEW.reviewed_by=NEW.proposed_by
 ) THEN RAISE EXCEPTION 'SKILL_SECURITY_REVIEW_REQUIRED'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER company_skill_pin_guard BEFORE INSERT OR UPDATE ON company_skill_proposals FOR EACH ROW EXECUTE FUNCTION company_skill_pin_guard();
