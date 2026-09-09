import datetime as dt
import unittest
import lead_goal
import aeo

class LeadGoalTests(unittest.TestCase):
    def test_unique_new_contacts_and_test_exclusion(self):
        def row(email, day, **over):
            return dict(created_at=day+'T12:00:00Z',email=email,full_name='Merchant',business_type='ecommerce',**over)
        rows=[row('returning@merchant.test','2026-08-20'),row('returning@merchant.test','2026-09-02'),
              row('new@merchant.test','2026-09-03'),row('new@merchant.test','2026-09-04'),
              row('qa+mpa-test-20260909@merchant.test','2026-09-04'),row('spam@merchant.test','2026-09-05',tags=['spam'])]
        result=lead_goal.summarize(rows,dt.datetime(2026,9,9,tzinfo=dt.timezone.utc))
        self.assertEqual(result['new_unique_requests'],1)
        self.assertEqual(result['trailing_30_days'],2)
        self.assertEqual(result['remaining'],9)
        self.assertNotIn('merchant.test',str(result))

    def test_failed_read_is_unknown(self):
        class Unavailable:
            def get(self,*args): raise RuntimeError('offline')
        self.assertFalse(lead_goal.read(Unavailable())['available'])

    def test_source_managed_glossary_cannot_queue_override(self):
        self.assertFalse(aeo.supports_answer_override('/glossary'))
        self.assertFalse(aeo.supports_answer_override('/glossary/vamp-ratio'))
        self.assertTrue(aeo.supports_answer_override('/comparisons/square-vs-stripe'))
        aeo.queue_refresh(object(),'/glossary/vamp-ratio','test')
