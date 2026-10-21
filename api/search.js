'use strict';

/**
 * Qansha flight and hotel metasearch is paused while the product focuses on
 * the city cost guide. Keep this route as an explicit no-op so old clients
 * cannot consume SerpApi credits. The metasearch implementation remains in
 * the archived GitHub branch.
 */
module.exports = async function pausedMetasearch(_req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(410).json({
    error: 'Flight and hotel metasearch is temporarily paused. Qansha city cost guide is active.'
  });
};
