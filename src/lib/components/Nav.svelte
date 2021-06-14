<script>
  import { darkMode } from '../stores/stores';

  export let segment;

  function toggleDarkMode() {
    darkMode.update(mode => (mode === 'dark' ? 'light' : 'dark'));
  }
</script>

<style>
  nav {
    font-weight: 300;
    padding-left: 1rem;
  }
  ul {
    margin: 0;
    padding: 0;
  }

  /* clearfix */
  ul::after {
    content: '';
    display: block;
    clear: both;
  }

  li {
    display: block;
    float: left;
  }

  [aria-current] {
    position: relative;
    display: inline-block;
  }

  [aria-current]::after {
    position: absolute;
    content: '';
    width: calc(100% - 1em);
    height: 2px;
    background-color: #7e30a8;
    display: block;
    bottom: -1px;
  }

  a {
    text-decoration: none;
    padding: 0.5em 0.5em;
    display: block;
    font-size: 1.2em;
  }

  .right {
    float: right;
  }

  /* darkmode switch */
  .switch input {
    -ms-filter: 'progid:DXImageTransform.Microsoft.Alpha(Opacity=0)';
    /* filter: alpha(opacity=0); */
    -moz-opacity: 0;
    opacity: 0;
    z-index: 100;
    position: absolute;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  .switch {
    width: 80px;
    height: 30px;
    position: relative;
    margin-right: 2rem;
    display: flex;
    align-items: center;
  }

  .switch label {
    display: block;
    width: 80%;
    height: 100%;
    position: relative;
    background: linear-gradient(#3f3c3c, #161d2b);
    border-radius: 30px 30px 30px 30px;
    box-shadow: inset 0 3px 8px 1px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(0, 0, 0, 0.5),
      0 1px 0 rgba(255, 255, 255, 0.2);
    -webkit-transition: all 0.5s ease;
    transition: all 0.5s ease;
  }

  .switch input ~ label i {
    display: block;
    height: 26px;
    width: 26px;
    position: absolute;
    left: 2px;
    top: 2px;
    z-index: 2;
    border-radius: inherit;
    background: #283446; /* Fallback */
    background: linear-gradient(#3f3c3c, #283446);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 8px rgba(0, 0, 0, 0.3), 0 12px 12px rgba(0, 0, 0, 0.4);
    -webkit-transition: all 0.5s ease;
    transition: all 0.5s ease;
  }

  .switch label + span {
    content: '';
    margin-left: 6px;
    width: 16px;
    height: 16px;
    border-radius: 8px;
    background: #283446;
    background: gradient-gradient(#3f3c3c, #283446);
    box-shadow: inset 0 1px 0 rgba(0, 0, 0, 0.2), 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 10px rgba(185, 231, 253, 0),
      inset 0 0 8px rgba(0, 0, 0, 0.9), inset 0 -2px 5px rgba(0, 0, 0, 0.3), inset 0 -5px 5px rgba(0, 0, 0, 0.5);
    -webkit-transition: all 0.5s ease;
    transition: all 0.5s ease;
    z-index: 2;
  }

  /* Toggle */

  .switch input:checked ~ label + span {
    content: '';
    margin-left: 6px;
    width: 16px;
    height: 16px;
    border-radius: 8px;
    -webkit-transition: all 0.5s ease;
    transition: all 0.5s ease;
    z-index: 2;
    background: #b9f3fe;
    background: gradient-gradient(#ffffff, #77a1b9);
    box-shadow: inset 0 1px 0 rgba(0, 0, 0, 0.1), 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 10px rgba(100, 231, 253, 1),
      inset 0 0 8px rgba(61, 157, 247, 0.8), inset 0 -2px 5px rgba(185, 231, 253, 0.3),
      inset 0 -3px 8px rgba(185, 231, 253, 0.5);
  }

  .switch input:checked ~ label i {
    left: auto;
    left: 63%;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 8px rgba(0, 0, 0, 0.3), 0 8px 8px rgba(0, 0, 0, 0.3),
      inset -1px 0 1px #b9f3fe;
    -webkit-transition: all 0.5s ease;
    transition: all 0.5s ease;
  }
</style>

<nav>
  <ul>
    <li>
      <a class="nav-link" aria-current={segment === undefined ? 'page' : undefined} href=".">home</a>
    </li>
    <li>
      <a class="nav-link" aria-current={segment === 'about' ? 'page' : undefined} href="about">about</a>
    </li>

    <!-- for the blog link, we're using rel=prefetch so that Sapper prefetches
		     the blog data when we hover over the link or tap it on a touchscreen -->
    <li>
      <a class="nav-link" rel="prefetch" aria-current={segment === 'blog' ? 'page' : undefined} href="blog">blog</a>
    </li>

    <li class="right">
      <div class="switch" on:change={toggleDarkMode}>
        <input type="checkbox" name="dark-mode-toggle" id="toggle" />
        <label for="dark-mode-toggle">
          <i />
        </label>
        <span />
      </div>
    </li>
  </ul>
</nav>
