import { Button, Pane, Text } from "evergreen-ui";
import { createUseStyles } from "react-jss";
import { Link } from "react-router-dom";

const useStyles = createUseStyles({
  navbarContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px"
  },
  contentContainer: {
    padding: "1rem 6rem",
  },
  navButton: {
    marginRight: "10px",
    fontWeight: 700,
  },
})

export default function PageWrapper(props) {
  const classes = useStyles();

  return (
    <Pane>
      <Pane className={classes.navbarContainer} background="blue300">
        <Pane>
          <Button is={Link} to="/" className={classes.navButton}>Home</Button>
        </Pane>
        <Pane>
          <Text background="white" padding="5px" borderRadius="5px">Please use MetaMask & Goerli Testnet</Text>
        </Pane>
        
      </Pane>
      <Pane className={classes.contentContainer}>
        {props.children}
      </Pane>
    </Pane>
  )
}
