import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  App: {
    padding: 0,
    margin: 0,
    minHeight: 'calc(100vh)',
    background: '#424242',
    },
  root: {
    flexGrow: 1,
  },

  // appBar
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  tab: {
    padding: '20px 10px',
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 500,
  },
  button: {
    margin: theme.spacing(1),
  },

  // card
  card: {
    display: 'flex',
    width: 360,
    height: 162,
    margin: '100px auto',
  },
  wide: {
    width: 442,
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    width: 'calc(100% - 30px)',
    flex: '1 0 auto',
    textAlign: 'center',
  },
  cover: {
    width: 151,
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  playIcon: {
    height: 38,
    width: 38,
  },

  label: {
    position: 'absolute',
    paddingTop: 6,
    paddingLeft: 12,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    cursor: 'pointer',
  },
  uploadBtn: {
    width: 116,
    height: 36,
    '& span': {
      '& span': {
        position: 'absolute',
        left: 16,
      },
    },
  },

  // paper field
  paperField: {
    margin: '0 auto',
    width: theme.spacing(80),
    minHeight: theme.spacing(50),
  },
  list: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    position: 'relative',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
  },
  listSection: {
    backgroundColor: 'inherit',
  },
  ul: {
    backgroundColor: 'inherit',
    padding: 0,
  },
}));

export default useStyles
