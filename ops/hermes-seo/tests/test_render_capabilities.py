import unittest
from unittest.mock import Mock, patch
import changes
import indexing
import pages

class RenderCapabilitiesTests(unittest.TestCase):
    def test_unrendered_h1_override_never_writes(self):
        ctx=Mock()
        self.assertEqual(changes.propose_or_apply(ctx,'insights','fixture','h1_override','Old','New','reason','human'),'blocked')
        self.assertEqual(ctx.mock_calls,[])

    def test_aeo_requires_entire_answer(self):
        page=pages.Page('<div class="aeo-answer">One two three four five six seven eight wrong ending</div>','/fixture')
        self.assertFalse(changes.observe('aeo_answer',page,'One two three four five six seven eight correct ending'))
        self.assertTrue(changes.observe('aeo_answer',page,'One two three four five six seven eight wrong ending'))
        self.assertFalse(changes.observe('aeo_answer',page,''))

    def test_article_index_api_is_not_called(self):
        with patch('indexing.requests.post') as post:
            result=indexing.google_index_push(['https://www.mypayadvisor.com/insights/fixture'],False)
        post.assert_not_called()
        self.assertEqual(result['asked'],0)
        self.assertIn('not eligible',result['skipped'])
