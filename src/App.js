import React from 'react'
import {
  AppBar,
  Toolbar,
  Button,
  Tabs,
  Tab,
  Typography,
  CardContent,
  Card,
  CardMedia,
  List,
  ListItem,
  ListItemText,
  Paper,
} from '@material-ui/core'
import { CloudUpload, EmojiObjects, Cancel } from '@material-ui/icons'
import cnames from 'classnames'
import {
  methodPrime,
  solvePostmanProblem,
  solveTravellingSalesmanProblem,
  solveFordFulkersonProblem,
  solveIsomorphismProblem,
} from './methods'
import bcgImage from './live-from-space.jpg'
import useStyles from './App.styles'

function App() {
  const classes = useStyles()
  const [value, setValue] = React.useState(0)
  const [file, setFile] = React.useState(null)
  const [result, setResult] = React.useState(null)

  const handleChange = (_, newValue) => setValue(newValue)
  const handleUploadFile = e => setFile(e.target.files[0])
  const handleCancel = () => setFile(null)

  React.useEffect(() => {
    setResult(null)
  }, [value])

  const onGetSolution = async () => {
    switch (value) {
      case 0: {
        const res = await methodPrime(file)
        await setResult({
          res,
          lengthText: 'Minimum cost',
        })
        break
      }
      case 1: {
        const res = await solvePostmanProblem(file)
        await setResult({
          res,
          lengthText: 'Minimum cost',
        })
        break
      }
      case 2: {
        const res = await solveTravellingSalesmanProblem(file)
        await setResult({
          res,
          lengthText: 'Minimum cost',
        })
        break
      }
      case 3: {
        const res = await solveFordFulkersonProblem(file)
        await setResult({
          res,
          lengthText: 'The maximum possible flow is',
        })
        break
      }
      case 4: {
        const res = await solveIsomorphismProblem(file)
        await setResult(res)
        break
      }
    }
  }

  return (
    <div className={classes.App}>
      <AppBar position="static" style={{ background: '#212121' }}>
        <Toolbar color={'rgba(0, 0, 0, 0.87)'}>
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="secondary"
            textColor="secondary"
            centered
          >
            <Tab className={classes.tab} label="Lab 1" />
            <Tab className={classes.tab} label="Lab 2" />
            <Tab className={classes.tab} label="Lab 3" />
            <Tab className={classes.tab} label="Lab 4" />
            <Tab className={classes.tab} label="Lab 5" />
          </Tabs>
        </Toolbar>
      </AppBar>

      <Card className={cnames(classes.card, !!file && classes.wide)}>
        <div className={classes.details}>
          <CardContent className={classes.content}>
            <Typography component="h5" variant="h5">
              {!!file ? <span>Uploaded</span> : <span>Upload input file</span>}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {!!file ? <span>&#9989;</span> : <span>&#129395;</span>}
            </Typography>
          </CardContent>
          <div className={classes.controls}>
            {!!file ? (
              <Button
                variant="contained"
                color="default"
                className={classes.button}
                startIcon={<Cancel />}
                onClick={handleCancel}
              >
                Cancel
              </Button>
            ) : (
              <>
                <input
                  id="upload"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleUploadFile}
                />
                <Button
                  variant="contained"
                  color="default"
                  className={cnames(classes.button, classes.uploadBtn)}
                  startIcon={<CloudUpload />}
                >
                  <label htmlFor="upload" className={classes.label}>Upload</label>
                </Button>
              </>
            )}
            {!!file && (
              <Button
                variant="contained"
                color="default"
                className={classes.button}
                startIcon={<EmojiObjects />}
                onClick={onGetSolution}
              >
                Solution
              </Button>
            )}
          </div>
        </div>
        <CardMedia
          className={classes.cover}
          image={bcgImage}
          title="Live from space album cover"
        />
      </Card>

      {!!result && (
        <Paper
          variant="outlined"
          className={classes.paperField}
          id="paper"
        >
          <Typography style={{ padding: 10 }} variant="h5" >Results:</Typography>
          <List className={classes.list} subheader={<li />}>
            {Object.entries(result.res)
              .sort((a, b) => a[0].charCodeAt(0) - b[0].charCodeAt(0))
              .map((value) => (
                <li key={`section-${value}`} className={classes.listSection}>
                  <ul className={classes.ul}>
                    {value[0] === '_length' && result.res.output &&
                      <ListItem key={`item-${value}-1`}>
                        <ListItemText primary={result.res.output}/>
                      </ListItem>
                    }
                    <ListItem key={`item-${value}-2`}>
                      {value[0] === '_length' && (
                        <ListItemText>{result.lengthText}: {value[1]}</ListItemText>
                      )}
                      {value[0] !== '_length' && !result.res.output && (
                        <ListItemText primary={`${value[0]} --> ${value[1]}`} />
                      )}
                    </ListItem>
                  </ul>
                </li>
            ))}
          </List>
        </Paper>
      )}

    </div>
  );
}

export default App;
